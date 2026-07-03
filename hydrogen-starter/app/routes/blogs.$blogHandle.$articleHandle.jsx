import {json} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';

export async function loader({params, context}) {
  const {blog} = await context.storefront.query(`#graphql
    query Article($blogHandle: String!, $articleHandle: String!) {
      blog(handle: $blogHandle) {
        articleByHandle(handle: $articleHandle) {
          id title contentHtml publishedAt
          author { name }
        }
      }
    }
  `, {variables: {blogHandle: params.blogHandle, articleHandle: params.articleHandle}});

  const article = blog?.articleByHandle;
  if (!article) throw new Response(null, {status: 404});
  return json({article});
}

export default function Article() {
  const {article} = useLoaderData();
  return (
    <div style={{maxWidth: 800, margin: '0 auto', padding: '40px 20px'}}>
      <h1>{article.title}</h1>
      <p>{article.author?.name} · {new Date(article.publishedAt).toLocaleDateString()}</p>
      <div dangerouslySetInnerHTML={{__html: article.contentHtml}} />
    </div>
  );
}
