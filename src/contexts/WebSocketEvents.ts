import { Member } from "../components/global/navbars/Channels";
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

  export type AddVoiceMemberPayload = {
    channel_id: string;
    member: Member;

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

  class AddVoiceMemberEvent {
    user_id: string | null | undefined;
    channel_id: string | null;
    server_id: string | null;
    handle: string | null | undefined;
  
    constructor(
      user_id: string | null | undefined,
      channel_id: string | null,
      server_id: string | null,
      handle: string | null | undefined
    ) {
      this.user_id = user_id;
      this.channel_id = channel_id;
      this.server_id = server_id;
      this.handle = handle
    }
  }
  
  class ChangeChatRoomEvent {
    id: string;
  
    constructor(id: string) {
      this.id = id;
    }
  }

  class ChangeVoiceRoomEvent {
    id: string | null;
  
    constructor(id: string | null) {
      this.id = id;
    }
  }

  class ChangeServerEvent {
    id: string | null;
  
    constructor(id: string | null) {
      this.id = id;
    }
  }

  export {
    Event,
    SendMessageEvent,
    ChangeChatRoomEvent,
    ChangeVoiceRoomEvent,
    AddVoiceMemberEvent,
    ChangeServerEvent
  }