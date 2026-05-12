<main className="lg:w-2/3">
                            <article className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <img src={event.image} alt={event.title} className="w-full h-[400px] object-cover" />

                                <div className="p-8 md:p-12">
                                    <h1 className="text-xl md:text-3xl font-extrabold text-gray-900 mb-6 leading-tight">
                                        {event.title}
                                    </h1>

                                    <div className="flex flex-wrap items-center gap-6 text-sm mb-8 pb-8 border-b border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-orange-500" />
                                            <span className="font-semibold text-gray-700">{event.organizer || "Admin"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-orange-500" />
                                            <span className="font-semibold text-gray-700">{event.date}</span>
                                        </div>
                                    </div>

                                    <div
                                        className="prose prose-blue max-w-none text-gray-700 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: contentWithIds }}
                                    />
                                </div>
                            </article>
                        </main>