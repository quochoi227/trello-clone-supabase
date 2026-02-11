export interface BoardInvitation {
  id: string;
  board_id: string;
  invitee_email: string;
  inviter_id: string;
  created_at: string;
  status: "pending" | "accepted" | "declined";
}

export interface InvitationWithDetails extends BoardInvitation {
  // inviter?: {
  //   id: string;
  //   email?: string;
  //   raw_user_meta_data?: {
  //     name?: string;
  //     full_name?: string;
  //   };
  // };
  board?: {
    id: string;
    title?: string;
  };
}