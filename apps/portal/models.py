from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import re
from django.core.serializers import serialize
import json
from django.core.serializers.json import DjangoJSONEncoder
from django.utils.translation import gettext_lazy as _

from apps.portal.libs.messages import TwilioAPI
from apps.portal.libs.email_finder import check_email_in_text

class TwilioAccount(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="twilio_account")
    twilio_account_sid = models.CharField(max_length=255)
    twilio_auth_token = models.CharField(max_length=255)
    websocket_id = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.user}'s TwilioAccount"

    def to_json(self):
        data = {
            'id': self.id,
            'user': self.user.username,
            'twilio_account_sid': self.twilio_account_sid,
            'twilio_auth_token': self.twilio_auth_token,
            'websocket_id': self.websocket_id,
        }
        return json.dumps(data, cls=DjangoJSONEncoder)

    def get_twilio_api_obj(self):
        return TwilioAPI(account_sid=self.twilio_account_sid, auth_token=self.twilio_auth_token)

class PhoneNumber(models.Model):
    twilio_account = models.ForeignKey(TwilioAccount, on_delete=models.CASCADE, related_name="phone_numbers")
    phone_number = models.CharField(max_length=20, unique=True)
    is_default = models.BooleanField(default=False)

    class Meta:
        unique_together = ('twilio_account', 'phone_number',)
    
    def __str__(self):
        return f"{self.phone_number}"
    
    def save(self, *args, **kwargs):
        if self.is_default:
            # Set all other phone numbers for the same twilio account as non-default
            PhoneNumber.objects.filter(twilio_account=self.twilio_account).exclude(pk=self.pk).update(is_default=False)

        super().save(*args, **kwargs)

    def to_json(self):
        data = {
            'id': self.id,
            'twilio_account': self.twilio_account.to_json(),
            'phone_number': self.phone_number,
            'is_default': self.is_default,
        }
        return json.dumps(data, cls=DjangoJSONEncoder)

class Contact(models.Model):
    twilio_account = models.ForeignKey(TwilioAccount, on_delete=models.CASCADE, related_name="contacts")
    name = models.CharField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    is_blocked = models.BooleanField(default=False)

    class Meta:
        unique_together = ('twilio_account', 'phone',)

    def __str__(self):
        return f"{self.name}"

    def save(self, *args, **kwargs):
        if not self.name:
            self.name = self.phone
        super().save(*args, **kwargs)

    def to_json(self):
        data = {
            'id': self.id,
            'twilio_account': self.twilio_account.to_json(),
            'name': self.name,
            'phone': self.phone,
            'email': self.email,
            'is_blocked': self.is_blocked,
        }
        return json.dumps(data, cls=DjangoJSONEncoder)


class Conversation(models.Model):
    class SENDER(models.TextChoices):
        ME = "me", _("Me")
        CUSTOMER = "customer", _("Customer")
    twilio_account = models.ForeignKey(TwilioAccount, on_delete=models.CASCADE, related_name="conversations")
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name="conversations")
    # Other fields for conversation details
    last_message = models.TextField(blank=True, null=True)
    last_sender = models.CharField(max_length=255, choices=SENDER.choices, blank=True, null=True)
    last_message_time = models.DateTimeField(blank=True, null=True)
    last_read_time = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_read = models.BooleanField(default=False)
    is_lead = models.BooleanField(default=False)
    is_replied = models.BooleanField(default=False)

    class Meta:
        ordering = ['-last_message_time', '-updated_at', '-created_at']
        unique_together = ('twilio_account', 'contact',)

    def __str__(self):
        return f"{self.twilio_account} <-> {self.contact}"
    
    def is_unread(self):
        if self.last_message:
            return not self.is_read or self.last_message_time > self.last_read_time
        return False
    
    def mark_as_read(self):
        self.is_read = True
        self.last_read_time = timezone.now()
        self.save()
    
    def to_json(self):
        data = {
            'id': self.id,
            'twilio_account': self.twilio_account.to_json(),
            'contact': self.contact.to_json(),
            'last_message': self.last_message,
            'last_sender': self.last_sender,
            'last_message_time': self.last_message_time,
            'last_read_time': self.last_read_time,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'is_read': self.is_read,
            'is_lead': self.is_lead,
            'is_replied': self.is_replied,
        }
        return json.dumps(data, cls=DjangoJSONEncoder)
    
    def save(self, *args, **kwargs):
        if not self.last_message:
            self.last_message_time = timezone.now()
        super().save(*args, **kwargs)
        

class Message(models.Model):

    class STATUS(models.TextChoices):
        QUEUED = "queued", _("Queued")
        FAILED = "failed", _("Failed")
        DELIVERED = "delivered", _("Delivered")
        SENT = "sent", _("Sent")
        UNDELIVERED = "undelivered", _("Undelivered")

    class SENDER(models.TextChoices):
        ME = "me", _("Me")
        CUSTOMER = "customer", _("Customer")

    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    sender = models.CharField(max_length=255, choices=SENDER.choices)  # 'twilio_account' or 'contact'
    sms_sid = models.CharField(max_length=255, blank=True, null=True) # sid
    from_number = models.CharField(max_length=20, blank=True, null=True)
    to_number = models.CharField(max_length=20, null=True, blank=True)
    text = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS.choices, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.conversation} => {self.text}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.conversation.last_sender = self.sender
        self.conversation.last_message_time = self.created_at
        if self.sender == self.SENDER.ME and self.status==self.STATUS.QUEUED:
            self.conversation.last_message = self.text
            self.conversation.is_read = True
            self.conversation.last_read_time = timezone.now()
        elif self.sender == self.SENDER.CUSTOMER:
            self.conversation.last_message = self.text
            self.conversation.is_read = False
            self.conversation.is_replied = True
            if not self.conversation.is_lead:
                self.conversation.is_lead = check_email_in_text(self.text)
        self.conversation.save()
        # super().save(*args, **kwargs)

    def to_json(self):
        data = {
            'id': self.id,
            'conversation': self.conversation.to_json(),
            'sender': self.sender,
            'sms_sid': self.sms_sid,
            'from_number': self.from_number,
            'to_number': self.to_number,
            'text': self.text,
            'status': self.status,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
        return json.dumps(data, cls=DjangoJSONEncoder)


class SoundProfile(models.Model):
    name = models.CharField(max_length=255, null=True, blank=False)
    message_received = models.FileField(upload_to='audio/custom_settings/', null=True, blank=False)
    got_a_lead = models.FileField(upload_to='audio/custom_settings/', null=True, blank=True)
    message_delivered = models.FileField(upload_to='audio/custom_settings/', null=True, blank=True)
    is_default = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.is_default:
            # Set all other phone numbers for the same twilio account as non-default
            SoundProfile.objects.filter().exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.name}"