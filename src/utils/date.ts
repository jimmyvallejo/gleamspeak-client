import { format, isToday, isThisYear, parseISO, isValid } from "date-fns";

export const formatMessageDate = (dateString: string | undefined): string => {
    if (!dateString) {
      return 'Unknown date';
    }
  
    try {
      const date = parseISO(dateString);
      
      if (!isValid(date)) {
        return 'Invalid date';
      }
      
      if (isToday(date)) {
        return `Today at ${format(date, 'h:mm a')}`;
      } else if (isThisYear(date)) {
        return format(date, 'MMM d \'at\' h:mm a');
      } else {
        return format(date, 'MMM d, yyyy \'at\' h:mm a');
      }
    } catch (error) {
      console.error('Error parsing date:', error);
      return 'Invalid date';
    }
  };