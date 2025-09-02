import firebase_admin
from firebase_admin import credentials, messaging

# Initialize Firebase Admin with your service account
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

def send_push(token: str, title: str, body: str):
    # Build message
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        token=token,  # FCM token from the client (React app)
    )

    # Send message
    response = messaging.send(message)
    print("Successfully sent message:", response)

if __name__ == "__main__":
    with open("fcm.key", 'r') as f:
        fcm_token = f.read()

    send_push(
        fcm_token,
        title="Library Reservation Update",
        body="Your reservation starts in 10 minutes!"
    )