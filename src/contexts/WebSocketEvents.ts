interface EventPayload {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }
  
  class Event<T extends EventPayload> {
    type: string;
    payload: T;
  
    constructor(type: string, payload: T) {
      this.type = type;
      this.payload = payload;
    }
  }
  class SendMessageEvent {
    message: string | null;
    from: string | null | undefined;
    handle: string | null | undefined;
    channel: string | null;
    image: string;
    avatar: string | null | undefined;
  
    constructor(
      message: string | null,
      from: string | null | undefined,
      handle: string | null | undefined,
      channel: string | null,
      image: string,
      avatar: string | null | undefined
    ) {
      this.message = message;
      this.from = from;
      this.handle = handle;
      this.channel = channel;
      this.image = image;
      this.avatar = avatar;
    }
  }
  
  class ChangeChatRoomEvent {
    id: string;
  
    constructor(name: string) {
      this.id = name;
    }
  }


  export {
    Event,
    SendMessageEvent,
    ChangeChatRoomEvent,
  }