declare module 'discord-interactions' {
  export function verifyKey(
    rawBody: string,
    signature: string,
    timestamp: string,
    clientPublicKey: string
  ): boolean;

  export enum InteractionType {
    PING = 1,
    APPLICATION_COMMAND = 2,
    MESSAGE_COMPONENT = 3,
    APPLICATION_COMMAND_AUTOCOMPLETE = 4,
    MODAL_SUBMIT = 5,
  }

  export enum InteractionResponseType {
    PONG = 1,
    CHANNEL_MESSAGE_WITH_SOURCE = 4,
    DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5,
    DEFERRED_UPDATE_MESSAGE = 6,
    UPDATE_MESSAGE = 7,
    APPLICATION_COMMAND_AUTOCOMPLETE_RESULT = 8,
    MODAL = 9,
  }

  export enum MessageComponentTypes {
    ACTION_ROW = 1,
    BUTTON = 2,
    SELECT_MENU = 3,
  }

  export enum ButtonStyleTypes {
    PRIMARY = 1,
    SECONDARY = 2,
    SUCCESS = 3,
    DANGER = 4,
    LINK = 5,
  }
}
