import {json} from '@shopify/remix-oxygen';
import {useLoaderData, Link} from '@remix-run/react';

export async function loader({params, context}) {
  const {blog} = await context.storefront.query(`#graphql
    query Blog($handle: String!) {
      blog(handle: $handle) {
        title
        articles(first: 20) {
          edges { node { id title handle publishedAt } }
        }
      }
    }
  `, {variables: {handle: params.blogHandle}});

  if (!blog) throw new Response(null, {status: 404});
  return json({blog});
}

export default function BlogIndex() {
  const {blog} = useLoaderData();
  return (
    <div style={{maxWidth: 800, margin: '0 auto', padding: '40px 20px'}}>
      <h1>{blog.title}</h1>
      <ul>
        {blog.articles.edges.map(({node}) => (
          <li key={node.id}>
            <Link to={`/blogs/${node.handle}`}>{node.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
