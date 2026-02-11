export interface Activity {
  id: string;
  card_id: string;
  board_id: string;
  user_id: string;
  action_type: 'comment_added' | 'comment_edited' | 'card_moved' | 'member_added';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  created_at: string;
  user?: {
    id: string;
    email: string;
    name: string;
    avatar: string;
  };
}

// Type cho response từ server (khi chưa join user)
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ActivityRaw extends Omit<Activity, 'user'> {
  // không có field user
}

// Type cho response từ server (khi đã join user)
export interface ActivityWithUser extends Activity {
  user: {
    id: string;
    email: string;
    name: string;
    avatar: string;
  };
}