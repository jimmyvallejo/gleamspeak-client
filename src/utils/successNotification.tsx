import { notifications } from '@mantine/notifications';

export const successNotification = (title = 'Success', message = 'Operation completed successfully') => {
  return notifications.show({
    title: title,
    message: message,
    color: 'green',
  });
};

export const errorNotification = (title = 'Error', message = 'An error occurred') => {
  return notifications.show({
    title: title,
    message: message,
    color: 'red',
  });
};