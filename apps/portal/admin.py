from django.contrib import admin

from apps.portal.models import (
    TwilioAccount, PhoneNumber, Contact, Conversation, Message, SoundProfile
)

@admin.register(TwilioAccount)
class TwilioAccountAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "twilio_account_sid", "twilio_auth_token", 'websocket_id']
    search_fields = ["user__username", "twilio_account_sid", "twilio_auth_token", 'websocket_id']


@admin.register(PhoneNumber)
class PhoneNumberAdmin(admin.ModelAdmin):
    list_display = ["id", "twilio_account", "phone_number", "is_default"]
    search_fields = ["twilio_account__twilio_account_sid", "phone_number", "is_default"]

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ["id", "twilio_account", "name", "phone", "email", "is_blocked"]
    search_fields = ["twilio_account__twilio_account_sid", "name", "phone", "email", "is_blocked"]

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = [
        "id", "twilio_account", "contact", "last_message", "last_sender", "last_message_time", 
        "last_read_time", "is_read", "is_lead", "is_replied", "created_at", "updated_at",
    ]
    search_fields = [
        "twilio_account__twilio_account_sid", "contact__phone", "last_message", "last_sender", "last_message_time", 
        "last_read_time", "is_read", "is_lead", "is_replied", "created_at", "updated_at",
    ]

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ["id", "conversation", "sender", "sms_sid", 'from_number', 'to_number', "text", "status", "created_at", 'updated_at' ]
    search_fields = [ "sender", "sms_sid", 'from_number', 'to_number', "text", "status", "created_at", 'updated_at' ]

@admin.register(SoundProfile)
class SoundProfileAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'is_default', 'message_received', 'got_a_lead', 'message_delivered']
    search_fields = ['name', ]