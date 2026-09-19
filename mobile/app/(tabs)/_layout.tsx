import { Tabs } from 'expo-router'
import { LayoutDashboard, Calendar, Shirt, User } from 'lucide-react-native'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#7A1F2B',
        tabBarInactiveTintColor: '#8a8378',
        tabBarStyle: { backgroundColor: '#F6F1E4', borderTopColor: '#DCD3C0' },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="probe"
        options={{ title: 'Probe', tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="kostimi"
        options={{ title: 'Kostimi', tabBarIcon: ({ color, size }) => <Shirt color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profil"
        options={{ title: 'Profil', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tabs>
  )
}