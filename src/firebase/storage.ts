import { storage } from "./set";
import { getDownloadURL, ref, uploadBytes, listAll } from "firebase/storage";
import { v4 } from "uuid";

const uploadFile = async (path: string, file: Blob, fileName: string) => {
  const somethingRef = ref(storage, `${path}/${fileName}`);
  const snapshot = await uploadBytes(somethingRef, file);

  return snapshot;
};

const getFileUrl = async (path: string) => {
  const url = await getDownloadURL(ref(storage, path));

  return url;
};

export const uploadImage = async (file: Blob | File) => {
  const fileName = v4();
  const filePath = "images/" + fileName;
  await uploadFile("images/", file, fileName);
  return getFileUrl(filePath);
};

export const getImageList = async () => {
  const listRef = ref(storage, "/images");

  const res = await listAll(listRef);
  const list = res.items.map(
    (itemRef) =>
      "https://firebasestorage.googleapis.com/v0/b/image-test-storage.appspot.com/o/" +
      "images%2F" +
      itemRef.name +
      "?alt=media"
  );
  return list;
};
