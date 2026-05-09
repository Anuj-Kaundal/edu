import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Calendar } from "lucide-react";
import Footer from "./Footer";
import { Link } from "react-router-dom";

type NewsType = {
  _id: string;
  title: string;
  excerpt: string;
  image: string;
  content: String,
  categories?: string[] | string;
  createdAt?: string;
  author?: string;
};

const News: React.FC = () => {
  const [newsList, setNewsList] = useState<NewsType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/shownew")
      .then((res) => setNewsList(res.data))
      .catch(() => console.log("Error fetching news"))
      .finally(() => setLoading(false));
  }, []);

  const filteredNews = newsList.filter((news) =>
    news.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tagColors = [
    "bg-red-100 text-red-600",
    "bg-blue-100 text-blue-600",
    "bg-slate-100 text-slate-600",
  ];

  if (loading)
    return (
      <div className="text-center py-20 text-gray-500">
        Loading News Updates...
      </div>
    );

  return (
    <>
      <div className="min-h-screen bg-[#F9FBFF] pb-20">
        {/* Header */}
        <header className="pt-16 pb-12 px-4 text-center">
          <h1 className="text-4xl font-bold mt-20 mb-4">
            Latest News
          </h1>

          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search news..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* Grid */}
        <main className="max-w-6xl mx-auto px-6 grid gap-10 md:grid-cols-2">
          {filteredNews.map((item) => {
            let categories: string[] = [];

            try {
              categories =
                typeof item.categories === "string"
                  ? JSON.parse(item.categories)
                  : item.categories || [];
            } catch {
              categories = ["News"];
            }

            return (
              <Link key={item._id} to={`/newsdetails/${item._id}`}>
                <div className="bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden h-full flex flex-col">
                  {/* Image */}
                  <img
                    src={item.image || "https://via.placeholder.com/600x400"}
                    alt=""
                    className="w-full h-60 object-fill"
                  />

                  {/* Content */}
                  <div className="p-6">
                    <p className="text-sm text-gray-400">{item.date}</p>
                    {/* Title */}
                    <h2 className="text-xl font-bold mb-2 text-gray-800">
                      {item.title}
                    </h2>

                    {/* Author */}
                    <p className="text-sm text-gray-400 mb-2">
                      By {item.author || "News Desk"}
                    </p>

                    {/* Excerpt */}
                    <p className="text-yellow-500 text-sm mb-4">
                      {item.excerpt}
                    </p>
                    <div
                      className="text-gray-600 max-w-none mt-5 space-y-5 line-clamp-4"
                      dangerouslySetInnerHTML={{
                        __html: item.content,
                      }}
                    ></div>

                    {/* Categories */}
                    <div className="flex gap-2 flex-wrap">
                      {categories.map((cat, i) => (
                        <span
                          key={i}
                          className={`${tagColors[i % tagColors.length]
                            } px-3 py-1 text-xs rounded-full`}
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </main>

        {/* Empty State */}
        {filteredNews.length === 0 && (
          <div className="text-center mt-20 text-gray-400">
            No news found
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default News;