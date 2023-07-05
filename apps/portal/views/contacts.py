from django.views import View
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from apps.portal.models import TwilioAccount, PhoneNumber, Contact, Conversation, Message
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.core import serializers


class ContactView(LoginRequiredMixin, View):
    def get(self, request):
        
        contacts = request.user.twilio_account.contacts.all()
        # Set the default pagination size
        page_number = request.GET.get('page', 1)
        paginator = Paginator(contacts, 50)
        

        try:
            # Get the specified page from the paginator
            page_obj = paginator.page(page_number)
            # Serialize the contacts on the page
            serialized_contacts = [contact.to_json() for contact in page_obj]
            # serialized_contacts = serializers.serialize('json', page_obj)

            # Prepare the JSON response
            response_data = {
                'status': 200,
                'message': 'Success',
                'data': {
                    'results': serialized_contacts,
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
        