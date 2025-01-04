import * as PusherPushNotifications from "@pusher/push-notifications-web";

const beamsClient = new PusherPushNotifications.Client({
  instanceId: '7489c2ed-669a-4c48-8f69-933dbef714a2',
});

export const initPushNotifications = async (userId) => {
  try {
    await beamsClient.start();
    await beamsClient.addDeviceInterest(`user-${userId}`);
    console.log('Successfully registered and subscribed!');
  } catch (error) {
    console.error('Could not register with Beams:', error);
  }
};

export const sendNotification = async (userId, title, body) => {
  try {
    const apiUrl = process.env.NODE_ENV === 'production'
      ? 'https://mingshuo.website/api/send-notification'
      : '/api/send-notification';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        notification: {
          title,
          body,
          deep_link: 'https://mingshuo.website/messages',
        }
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to send notification');
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}; 