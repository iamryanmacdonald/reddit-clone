import PostVote, { VoteType } from "~/components/post-vote";
import { CompletePost } from "~/lib/validators";

interface PostProps {
  loggedIn: boolean;
  post: CompletePost;
  username: string;
  vote: number;
  votes: number;
}

export default function Post(props: PostProps) {
  const { loggedIn, post, username, vote, votes } = props;

  return (
    <div className="mb-2 rounded-md border px-4">
      <div className="flex gap-4">
        {loggedIn && (
          <PostVote postId={post.id} vote={vote as VoteType} votes={votes} />
        )}
        <div className="flex flex-col justify-between py-2">
          <div className="flex flex-col">
            <div className="text-xl font-semibold">{post.title}</div>
            <div>by {username}</div>
          </div>
          <div className="mt-1 flex items-center gap-4">
            <div className="rounded-md px-2 py-1 hover:cursor-pointer hover:bg-secondary">
              0 comments
            </div>
            <div className="rounded-md px-2 py-1 hover:cursor-pointer hover:bg-secondary">
              save
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
