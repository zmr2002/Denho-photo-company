import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ArticleContent } from "@/components/pages/ArticleContent";
import { mapArticleContentBlocks } from "@/lib/content/article-content";
import type { ArticleContentBlock } from "@/lib/content/types";

describe("article content", () => {
  it("renders headings, paragraphs, and multiple images in the stored order", () => {
    const blocks: ArticleContentBlock[] = [
      { type: "heading", text: "拍摄准备" },
      { type: "paragraph", text: "第一段正文" },
      {
        type: "image",
        image: {
          label: "现场图片一",
          alt: "第一张现场图片",
          tone: "warm",
          src: "/media/original/first.jpg",
          caption: "第一张图片说明",
        },
      },
      {
        type: "image",
        image: {
          label: "现场图片二",
          alt: "第二张现场图片",
          tone: "cool",
          src: "/media/original/second.jpg",
        },
      },
      { type: "paragraph", text: "第二段正文" },
    ];

    const { container } = render(<ArticleContent blocks={blocks} />);
    const content = container.firstElementChild;
    expect(content).not.toBeNull();
    expect(Array.from(content?.children ?? []).map((element) => element.tagName)).toEqual([
      "H2",
      "P",
      "FIGURE",
      "FIGURE",
      "P",
    ]);
    expect(screen.getByRole("heading", { level: 2, name: "拍摄准备" })).toBeInTheDocument();
    expect(screen.getAllByRole("img").map((image) => image.getAttribute("alt"))).toEqual([
      "第一张现场图片",
      "第二张现场图片",
    ]);
    expect(screen.getByText("第一张图片说明")).toBeInTheDocument();
  });

  it("sorts source blocks and keeps compatible legacy content", () => {
    const blocks = mapArticleContentBlocks(
      [
        {
          type: "paragraph",
          heading: null,
          body: "结束正文",
          imagePath: null,
          imageAlt: null,
          imageTone: "neutral",
          caption: null,
          sortOrder: 30,
        },
        {
          type: "legacy",
          heading: "旧小标题",
          body: "旧正文",
          imagePath: "/media/original/legacy.jpg",
          imageAlt: "旧文章图片",
          imageTone: "unexpected",
          caption: "旧图片说明",
          sortOrder: 10,
        },
        {
          type: "image",
          heading: null,
          body: null,
          imagePath: "/media/original/current.jpg",
          imageAlt: "当前图片",
          imageTone: "cool",
          caption: null,
          sortOrder: 20,
        },
      ],
      "文章图片",
    );

    expect(blocks).toEqual([
      { type: "heading", text: "旧小标题" },
      { type: "paragraph", text: "旧正文" },
      {
        type: "image",
        image: {
          label: "旧小标题",
          alt: "旧文章图片",
          tone: "neutral",
          caption: "旧图片说明",
          src: "/media/original/legacy.jpg",
        },
      },
      {
        type: "image",
        image: {
          label: "文章图片",
          alt: "当前图片",
          tone: "cool",
          caption: undefined,
          src: "/media/original/current.jpg",
        },
      },
      { type: "paragraph", text: "结束正文" },
    ]);
  });
});
