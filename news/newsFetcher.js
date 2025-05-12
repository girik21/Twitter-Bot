import axios from "axios";

export const fetchTopstories = async (limit = 20) => {
  try {
    const response = await axios.get("https://hacker-news.firebaseio.com/v0/topstories.json");

    if (response) {
      const storyId = response.data.slice(0, limit);

      const storyResponse = await Promise.all(
        storyId.map((id) => axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`))
      );

      return storyResponse
        .map((result) => ({
          id: result.data.id, // include original Hacker News ID
          title: result.data.title,
          url: result.data.url,
        }))
        .filter((story) => story.title && story.url);

    }
  } catch (error) {
    console.log("Error Calling the Hacker News API", error);
  }
};
