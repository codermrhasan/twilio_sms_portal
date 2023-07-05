from django.views import View
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from apps.portal.models import TwilioAccount, PhoneNumber, Contact, Conversation, Message
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.core import serializers


class ContactNConversationView(LoginRequiredMixin, View):
    def post(self, request):
        data = request.POST
        phone = data.get('phone')

        twilio_account = request.user.twilio_account
        contact, contact_created = Contact.objects.get_or_create(twilio_account=twilio_account, phone=phone)
        conversation, conversation_created = Conversation.objects.get_or_create(twilio_account=twilio_account, contact=contact)
        response_data = {
            'status': 200,
            'message': 'Success',
            'data': {
                'results': conversation.to_json(),
            }
        }

        return JsonResponse(response_data, status=200)
