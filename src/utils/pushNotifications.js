import * as PusherPushNotifications from "@pusher/push-notifications-web";

export const initPushNotifications = async (userId) => {
  try {
    // 检查是否支持推送通知
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.warn('This browser does not support push notifications');
      return;
    }

    // 检查是否有 Pusher Beams
    if (!window.PusherPushNotifications) {
      console.warn('Pusher Beams not available');
      return;
    }

    // 初始化 Pusher Beams
    const beamsClient = new window.PusherPushNotifications.Client({
      instanceId: process.env.PUSHER_APP_ID,
    });

    await beamsClient.start();
    await beamsClient.setUserId(userId);
  } catch (error) {
    console.warn('Push notification initialization failed:', error);
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