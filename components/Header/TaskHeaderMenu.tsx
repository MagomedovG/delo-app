import { useActionSheet } from '@expo/react-native-action-sheet';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, StyleSheet, useColorScheme } from 'react-native';

export default function TaskHeaderMenu() {
  const { showActionSheetWithOptions } = useActionSheet();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const showMenu = () => {
    const options = ['Сохранить', 'Скрыть', 'Отмена'];
    const destructiveButtonIndex = 1;
    const cancelButtonIndex = 2;
    const handleHidePress = () => {
        Alert.alert(
          'Скрыть задание',
          'Выберите причину скрытия:',
          [
            {
              text: 'Не показывать эту категорию',
              onPress: () => console.log('Скрыть категорию?'),
            },
            {
              text: 'Не интересует это задание',
              onPress: () => console.log('Скрыть задание?'),
            },
            {
              text: 'Не подходит город или регион',
              onPress: () => console.log('Скрыть по региону?'),
            },
            {
              text: 'Отмена',
              style: 'cancel',
            },
          ]
        );
      };
    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      (selectedIndex) => {
        switch (selectedIndex) {
          case 0:
            console.log('Сохранить');
            break;
          case 1:
            handleHidePress()
            console.log('Скрыть');
            break;
          case 2:
            // Cancel
            break;
        }
      }
    );
  };

  return (
    <Pressable 
      onPress={showMenu}
      style={styles.menuButton}
    >
      <Ionicons 
        name="ellipsis-horizontal" 
        size={24} 
        color={isDark ? "#fff" : "#000"} 
      />
    </Pressable>
  );
};
const styles = StyleSheet.create({
    menuButton: {
      paddingHorizontal: 12,
      paddingVertical: 5,
    },
  });