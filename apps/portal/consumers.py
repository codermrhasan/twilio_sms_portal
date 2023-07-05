# chat/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = self.room_name #"chat_%s" % self.room_name

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]
        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "chat_message", "message": message}
        )

    # Receive message from room group
    async def chat_message(self, event):
        message = event["message"]

        # Send message to WebSocket
        await self.send(text_data=json.dumps({"message": message}))

    

"""
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("-------connect 1-------")

        self.channel_name = self.scope["url_route"]["kwargs"]["channel_name"]
        # self.room_group_name = "chat_%s" % self.room_name

        # Add the consumer to a group
        # await self.channel_layer.group_add('notifications', self.channel_name)
        # await self.accept()
    
        # Create a unique channel name for the user
        # user = self.scope["user"]
        # channel_name = f"user_{user.id}"
        
        # Add the consumer to the user's specific channel
        await self.channel_layer.group_add(self.channel_name, self.channel_name)
        await self.accept()
        print("-------connect 2-------")
        print(self.channel_name)
        print("-------connect end-------")

    async def disconnect(self, close_code):
        # # Remove the consumer from the group
        # await self.channel_layer.group_discard('notifications', self.channel_name)

        # Retrieve the user ID from the channel name
        channel_name = self.channel_name
        # user_id = int(channel_name.split("_")[1])

        # Create a unique channel name for the user
        # channel_name = f"user_{user_id}"

        # Remove the consumer from the user's specific channel
        await self.channel_layer.group_discard(channel_name, self.channel_name)
        print("-------disconnect-------")
        print(channel_name)
        print("--------------")

    async def receive(self, text_data):
        print("-------receive-------")
        print("--------------")
        pass

    async def notification_message(self, event):
        # Send the notification message to the client
        # await self.send(text_data=event['message'])
        # Extract the relevant channel_name from the event
        print("+++++++++++++=in _notificaiton_message___________")
        channel_name = event['channel_name']
        print(channel_name)

        # Check if the channel_name is the same as the connected channel
        if self.channel_name == channel_name:
            # Send the notification only to the relevant channel
            await self.send_json({
                'type': 'notification',
                'message': event['message']
            })
"""

