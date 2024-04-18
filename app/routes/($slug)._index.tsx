// ($slug)._index.tsx
import {
  fetchOneEntry,
  isEditing,
  isPreviewing,
  getBuilderSearchParams,
  Content,
} from "@builder.io/sdk-react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const apiKey = "f1a790f8c3204b3b8c5c1795aeac4660"; // Replace with your actual API key

  const urlPath = `/${params["slug"] || ""}`;

  await import("@builder.io/sdk-react/init");
  console.log("fetching for ", urlPath);

  return fetchOneEntry({
    model: "page",
    apiKey: apiKey,
    options: getBuilderSearchParams(url.searchParams),
    userAttributes: { urlPath },
    fetch: (url: any, info: any): any =>
      import("node-fetch").then((mod) => mod.default(url, info)),
  })
    .then((page) => {
      console.log("fetched page: ", page);

      const isEditingOrPreviewing = isEditing() || isPreviewing();

      if (!page && !isEditingOrPreviewing) {
        throw new Response("Page Not Found", {
          status: 404,
          statusText: "Page not found in Builder.io",
        });
      }

      return { page };
    })
    .catch((error: any) => {
      console.error(error);
      throw new Response("Fetching Error", {
        status: 500,
        statusText: error.message,
      });
    });
};

// Define and render the page.
export default function Page() {
  // Use the useLoaderData hook to get the Page data from `loader` above.
  const { page } = useLoaderData<typeof loader>();

  // console.log("rendering page", page);

  return (
    <div>
      Hello
      <h1>{page?.name}</h1>
      <p>{page?.id}</p>
      <Content model="page" apiKey="YOUR_API_KEY" content={page as any} />
    </div>
  );

  // Render the page content from Builder.io
}
