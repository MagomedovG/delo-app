// app/(user)/_layout.tsx
// import ArrowLeft from '@/components/Icons/ArrowLeft';
import TaskHeaderMenu from '@/components/Header/TaskHeaderMenu';
import { Stack } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { useColorScheme } from 'react-native';



export default function UserLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  return (
    <Stack>
      <Stack.Screen name="tabs" options={{ headerShown: false }} />
      <Stack.Screen name="task-detail" options={{ headerShown: false }}/>
      <Stack.Screen name="create-task/index" 
          options={({navigation}) => ({ 
            title: 'Создание задачи',
            headerShown: true,
            headerBackTitle: "Назад",
            headerLeft: () => (
              <Pressable 
                onPress={() => navigation.goBack()} 
                style={{paddingHorizontal:12, paddingVertical:5}}
              >
                <ArrowLeft color={isDark ? "#fff" : "#000"}/>
              </Pressable>
              )
            })}/>
      <Stack.Screen name="task/[id]" 
        options={({navigation}) => ({ 
          title: '',
          headerShown: true,
          headerBackTitle: "Назад",
          headerLeft: () => (
            <Pressable 
              onPress={() => navigation.goBack()} 
              style={{paddingHorizontal:12, paddingVertical:5}}
            >
              <ArrowLeft color={isDark ? "#fff" : "#000"}/>
            </Pressable>
            ),
            headerRight: () => <TaskHeaderMenu/>
          })
        }
      />
      <Stack.Screen name="edit-profile" 
        options={({navigation}) => ({ 
          title: 'Редактировать профиль',
          headerShown: true,
          headerBackTitle: "Назад",
          headerLeft: () => (
            <Pressable 
              onPress={() => navigation.goBack()} 
              style={{paddingHorizontal:12, paddingVertical:5}}
            >
              <ArrowLeft color={isDark ? "#fff" : "#000"}/>
            </Pressable>
            ),
            // headerRight: () => <TaskHeaderMenu/>
          })
        }
      />
    </Stack>
  );
}