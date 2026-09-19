export async function sendPushNotification(pushToken: string, title: string, body: string) {
  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: pushToken,
      sound: 'default',
      title,
      body,
    }),
  })

  const result = await response.json()
  console.log('EXPO PUSH RESPONSE:', JSON.stringify(result))
}