export const USER_ROLES = Object.freeze({
  INTERNAL: 1,
  PARTNER: 2,
});

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
