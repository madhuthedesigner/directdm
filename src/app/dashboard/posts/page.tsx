"use client";

import { useState } from "react";

export default function PostsPage() {
    const [posts] = useState([
        {
            id: "1",
            caption: "Check out our new collection! 🔥",
            thumbnail: "https://placehold.co/300x300/1e293b/60a5fa?text=Post+1",
            likes: 1234,
            comments: 56,
            automated: true,
            keywords: ["price", "buy", "shop"],
        },
        {
            id: "2",
            caption: "Summer vibes ☀️ Limited time offer!",
            thumbnail: "https://placehold.co/300x300/1e293b/60a5fa?text=Post+2",
            likes: 892,
            comments: 34,
            automated: true,
            keywords: ["discount", "sale"],
        },
        {
            id: "3",
            caption: "Behind the scenes 📸",
            thumbnail: "https://placehold.co/300x300/1e293b/60a5fa?text=Post+3",
            likes: 445,
            comments: 12,
            automated: false,
            keywords: [],
        },
    ]);

    const toggleAutomation = (postId: string) => {
        alert(`Toggled automation for post ${postId}`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Posts</h1>
                <p className="text-muted-foreground mt-1">
                    Manage automation settings for each Instagram post
                </p>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {posts.map((post) => (
                    <div
                        key={post.id}
                        className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
                    >
                        {/* Post Image */}
                        <div className="aspect-square bg-secondary relative">
                            <img
                                src={post.thumbnail}
                                alt={post.caption}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 right-3">
                                <button
                                    onClick={() => toggleAutomation(post.id)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${post.automated
                                            ? "bg-green-500 text-white"
                                            : "bg-red-500 text-white"
                                        }`}
                                >
                                    {post.automated ? "✓ Auto-Reply ON" : "✗ Auto-Reply OFF"}
                                </button>
                            </div>
                        </div>

                        {/* Post Details */}
                        <div className="p-6">
                            <p className="text-sm mb-4">{post.caption}</p>

                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                                <span>❤️ {post.likes}</span>
                                <span>💬 {post.comments}</span>
                            </div>

                            {/* Keywords */}
                            {post.automated && post.keywords.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-xs text-muted-foreground mb-2">
                                        Keyword Triggers:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {post.keywords.map((keyword, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full"
                                            >
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex space-x-2">
                                <button className="flex-1 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm">
                                    Edit Keywords
                                </button>
                                <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm">
                                    View Comments
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Post Settings */}
            <div className="bg-card border border-dashed border-border rounded-lg p-8 text-center">
                <p className="text-muted-foreground mb-4">
                    Configure automation for new posts
                </p>
                <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    Sync Instagram Posts
                </button>
            </div>
        </div>
    );
}
