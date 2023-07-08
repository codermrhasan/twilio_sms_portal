from django.views import View
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from apps.portal.models import TwilioAccount, PhoneNumber, Contact, Conversation, Message
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.core import serializers


class ConversationView(LoginRequiredMixin, View):
    def get(self, request):
        # twilio_account_id = request.GET.get('twilio_account_id')
        # contact_id = request.GET.get('contact_id')
        conversations = request.user.twilio_account.conversations.all()
        # Set the default pagination size
        page_number = request.GET.get('page', 1)
        paginator = Paginator(conversations, 50)
        

        try:
            # Get the specified page from the paginator
            page_obj = paginator.page(page_number)

            # Serialize conversations for the current page
            serialized_conversations = [conversation.to_json() for conversation in page_obj]
            unread_conversations = conversations.filter(is_read=False)
            # Prepare the JSON response
            response_data = {
                'status': 200,
                'message': 'Success',
                'data': {
                    'results': serialized_conversations,
                    'unread_messages': len(unread_conversations),
                    'pagination': {
                        'count': paginator.count,
                        'next': page_obj.next_page_number() if page_obj.has_next() else None,
                        'previous': page_obj.previous_page_number() if page_obj.has_previous() else None,
                        'page_number': page_obj.number,
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

       
class MarkAsReadUnreadView(LoginRequiredMixin, View):
    def post(self, request):

        data = request.POST
        is_read = data.get('is_read') == 'true'
        conversation_id = int(data.get('conversation_id'))
        conversation = request.user.twilio_account.conversations.filter(id=conversation_id).first()
        conversation.is_read = is_read
        conversation.save()
        
        # Serialize conversations for the current page
        serialized_conversation = conversation.to_json()

        # Prepare the JSON response
        response_data = {
            'status': 200,
            'message': 'Success',
            'data': {
                'results': serialized_conversation,
            }
        }
        return JsonResponse(response_data, status=200)
        