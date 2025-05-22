"use client";
type Props = {
  publish: () => Promise<void>;
  disabled?: boolean;
};

export default function PublishButton({ publish, disabled }: Props) {
  return (
    <button onClick={publish} className="cursor-pointer" >
      Publish
    </button>
  );
}
