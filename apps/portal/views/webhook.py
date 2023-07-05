from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from apps.portal.models import Message, TwilioAccount, Contact, Conversation


channel_layer = get_channel_layer()

@csrf_exempt
def sent_sms_status(request):
    if request.method == "POST":
        data = request.POST
        
        sms_sid = data.get('SmsSid')
        message = Message.objects.get(sms_sid = sms_sid)
        message.status = data.get('MessageStatus')
        message.save()
        message.conversation.twilio_account.user.id
        channel_name = f"user_{message.conversation.twilio_account.user.id}"
        
        serialized_message = message.to_json() #[message.to_json() for message in page_obj]
        response_data = {
            'type': "sent_sms_status",
            'results': serialized_message
        }

        # Send notification to relevant channel
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(channel_name, {
            'type': 'chat_message',
            'message': response_data,
        })
    return HttpResponse()


@csrf_exempt
def receive_sms(request):
    if request.method == 'POST':
        data = request.POST

        # try to get message obj

        # if not found create convers

        twilio_account = TwilioAccount.objects.get(twilio_account_sid=data.get('AccountSid', None))
        contact, contact_created = Contact.objects.get_or_create(
            phone=data.get('From'),
            twilio_account = twilio_account,
            # defaults={'name': name, 'email': email}
        )
        conversation, conversation_created = Conversation.objects.get_or_create(
            twilio_account = twilio_account,
            contact = contact
        )
        message = Message.objects.create(
            conversation = conversation,
            sender = Message.SENDER.CUSTOMER,
            sms_sid = data.get('SmsSid'),
            from_number = data.get('From'),
            to_number = data.get('To'),
            text = data.get('Body'),
            status = data.get('SmsStatus'),
        )

        channel_name = f"user_{twilio_account.user.id}"
        serialized_message = message.to_json() #[message.to_json() for message in page_obj]
        response_data = {
            'type': "receive_sms",
            'results': serialized_message
        }

        # Send notification to relevant channel
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(channel_name, {
            'type': 'chat_message',
            'message': response_data,
        })

    return HttpResponse()
