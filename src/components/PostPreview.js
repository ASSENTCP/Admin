import React from "react";

const PostPreview = ({ title, content, mediaUrl }) => {
  return (
    <div>
      <h3>{title}</h3>
      <div dangerouslySetInnerHTML={{ __html: content }} />
      {mediaUrl && mediaUrl !== "" && (
        <div>
          {mediaUrl.includes(".mp4") ? (
            <video controls>
              <source src={mediaUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img src={mediaUrl} alt="Post" style={{ maxWidth: "100%" }} />
          )}
        </div>
      )}
    </div>
  );
};

export default PostPreview;
