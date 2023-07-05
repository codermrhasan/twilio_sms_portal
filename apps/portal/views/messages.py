from django.views import View
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from apps.portal.models import TwilioAccount, PhoneNumber, Contact, Conversation, Message
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.core import serializers
import json

from apps.portal.libs.messages import TwilioAPI

class MessageView(LoginRequiredMixin, View):
    def get(self, request):
        # twilio_account_id = request.GET.get('twilio_account_id')
        # contact_id = request.GET.get('contact_id')
        conversation_id = int(request.GET.get('conversation_id'))
        messages = Message.objects.filter(conversation__id=conversation_id)
        # messages = request.user.twilio_account.conversations.all()
        # Set the default pagination size
        page_number = request.GET.get('page', 1)
        paginator = Paginator(messages, 50)
        

        try:
            # Get the specified page from the paginator
            page_obj = paginator.page(page_number)

            # Serialize messages for the current page
            serialized_messages = [message.to_json() for message in page_obj]
            
            # Prepare the JSON response
            response_data = {
                'status': 200,
                'message': 'Success',
                'data': {
                    'results': serialized_messages,
                    'pagination': {
                        'count': paginator.count,
                        'next': page_obj.next_page_number() if page_obj.has_next() else None,
                        'previous': page_obj.previous_page_number() if page_obj.has_previous() else None,
                    }
                }
            }
            return JsonResponse(response_data, status=200)
        except PageNotAnInteger:
            # Handle the case when the page number is not an integer
            response_data = {
                'status': 400,
                'message': 'Invalid page number',
            }
            return JsonResponse(response_data, status=400)
        except EmptyPage:
            # Handle the case when the requested page is out of range
            response_data = {
                'status': 404,
                'message': 'Page not found',
            }
            return JsonResponse(response_data, status=404)
        
    def post(self, request):
        # twilio_account_id = request.GET.get('twilio_account_id')
        # contact_id = request.GET.get('contact_id')
        js_sms_uuid = request.POST.get('js_sms_uuid') if request.POST.get('js_sms_uuid') else ""
        conversation_id = int(request.POST.get('conversation_id'))
        text = request.POST.get('text')
        conversation = Conversation.objects.get(id=conversation_id)

        twilio_account = request.user.twilio_account
        twilio = twilio_account.get_twilio_api_obj()
        phone_number = twilio_account.phone_numbers.get(is_default=True)
        response = twilio.send_sms(from_number=phone_number.phone_number, to_number=conversation.contact.phone, text=text)
        message = Message.objects.create(
            conversation = conversation,
            sender = Message.SENDER.ME,
            sms_sid = response.sid,
            from_number = response.from_,
            to_number = response.to,
            text = response.body,
            status = response.status,
        )

        # Serialize messages for the current page
        serialized_message = message.to_json() #[message.to_json() for message in page_obj]
        response_data = {
            'status': 200,
            'message': 'Success',
            'data': {
                'results': serialized_message,
                'js_sms_uuid': js_sms_uuid
            }
        }
        return JsonResponse(response_data, status=200)
    

