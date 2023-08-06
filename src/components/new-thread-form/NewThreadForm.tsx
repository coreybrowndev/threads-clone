import { SyntheticEvent, useContext, useState, useRef, useEffect } from "react";
import "./newThreadFormStyles.scss";
import { Image } from "react-feather";
import { db, storage } from "../../config/firebase-config";
import { addDoc, collection, getDoc, doc } from "firebase/firestore";
import { ThreadContext } from "../../context/ThreadContext";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 } from "uuid";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";

const NewThreadForm: React.FC = () => {
  const [threadBody, setThreadBody] = useState<string>("");
  const { getThreads } = useContext(ThreadContext);
  const [imageUrl, setImageUrl] = useState<string>("");

  const threadsCollection = collection(db, "threads");
  const fileRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const { currentUserData } = useUser();

  const handleThreadSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
      await addDoc(threadsCollection, {
        body: threadBody,
        created_time: new Date(),
        image: imageUrl,
        owner_id: user?.uid,
        likes_count: 0,
      });
      setThreadBody("");
      setImageUrl("");
      getThreads();
    } catch (err) {
      console.error(err);
    }
  };

  const fileSelectedHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileObj = e.target.files && e.target.files[0];

    if (!fileObj) {
      return;
    }

    const storageRef = ref(storage, `/images/${fileObj.name + v4()}`);
    uploadBytes(storageRef, fileObj).then(async () => {
      const imageRef = ref(storage, storageRef.fullPath);
      const imageUrl = await getDownloadURL(imageRef);
      setImageUrl(imageUrl);
    });
  };

  const handleClick = async () => {
    if (fileRef.current) {
      fileRef.current.click();
    }
  };

  return (
    <div className="new-thread-form-wrapper">
      <div className="new-thread-current-user-wrapper">
        <div className="image-wrapper">
          <img src={currentUserData?.image} alt="Profile Picture" />
        </div>
        <div className="user-wrapper">
          <strong style={{ textTransform: "lowercase" }}>
            {currentUserData?.user_name}
          </strong>
        </div>
      </div>
      <form onSubmit={handleThreadSubmit}>
        <textarea
          required
          name="body"
          placeholder="Start a Thread..."
          value={threadBody}
          onChange={(e) => setThreadBody(e.target.value)}
        ></textarea>

        {<img className="uploaded-new-thread-image" src={imageUrl} />}
        <div className="new-thread-action-items">
          <button type="submit">Post</button>
          <input
            style={{ display: "none" }}
            type="file"
            ref={fileRef}
            onChange={fileSelectedHandler}
          />
          <Image style={{ cursor: "pointer" }} onClick={handleClick} />
        </div>
      </form>
    </div>
  );
};

export default NewThreadForm;
