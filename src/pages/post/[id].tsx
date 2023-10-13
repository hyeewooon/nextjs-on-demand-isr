import { useRouter } from 'next/router';
import type {
  InferGetStaticPropsType,
  GetStaticProps,
  GetStaticPaths,
} from 'next';
import { useState } from 'react';

interface Post {
  id: number;
  title: string;
  description: string;
  timestamp?: number;
}

export default function Page({
  data: { id: listId, title, description, timestamp = 0 },
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  const { id } = router.query;

  const [result, setResult] = useState('');

  const revalidate = async () => {
    await fetch(`http://localhost:3000/api/revalidate?secret=1234`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
      }),
    });
    setResult('Done. Try to refresh the page');
  };

  return (
    <div>
      <p>
        post: {listId} {title} {description}
      </p>
      <p>timestamp: {timestamp}</p>
      <button
        className="p-2 rounded-md text-black bg-green-200 ease-linear hover:bg-green-300"
        onClick={() => {
          revalidate();
        }}
      >
        revalidate
      </button>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const res = await fetch('http://localhost:4000/list');
  const data: Post[] = await res.json();

  const paths = data.map(({ id }) => ({
    params: { id: String(id) },
  }));
  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<{
  data: Post;
}> = async (context) => {
  try {
    const { id } = context.params!;
    const res = await fetch(`http://localhost:4000/list/${id}`);
    const data: Post = await res.json();

    return {
      props: { data: { ...data, timestamp: Date.now() } },
    };
  } catch (err) {
    return {
      notFound: true,
    };
  }
};
