"use client";

import { useState } from "react";
import Image from "next/image";
import { getCroppedImg } from "../lib/canvasUtils";
import Cropper from "react-easy-crop";
import Resizer from "react-image-file-resizer";

const uploadBlobToBackend = async (blob: Blob, name: string) => {
  const data = new FormData();
  data.append("file", blob, name);

  const response = await fetch("/api/ipfs/upload", {
    method: "POST",
    body: data,
  });

  const result = await response.json();
  return result.ipfsHash;
};

interface EditAvatarProps {
  accountAddress: string;
  avatarUrl: string;
  onChange: (
    value: null | {
      image: string;
      image_medium: string;
      image_small: string;
    },
  ) => void;
}

export default function EditAvatar({ accountAddress, avatarUrl, onChange }: EditAvatarProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [imageDataURL, setImageDataURL] = useState(null);
  const [status, setStatus] = useState<string | null>("saved");

  avatarUrl = avatarUrl || "/nfcwallet-icon.jpg";

  const triggerFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const fileInput = document.getElementById("avatar");
    fileInput?.click();
    return false;
  };

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setStatus("editing");
    const file = event?.target?.files[0];
    try {
      const imageData = await readFile(file);

      setImageDataURL(imageData);
      console.log("File size:", file.size / 1024 / 1024, "MB");
    } catch (e) {
      setStatus("saved"); // user cancelled file selection
      console.error(e);
    }
    return false;
    // Now you can use this file object to preview the image or upload it to a server
  };

  const handleChangeAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (status == "saved") return triggerFileSelect(event);
    setStatus("saving");
    const images = await processCroppedImage();
    onChange(images);
    return false;
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const resizeImage = (file: File, width: number, height: number): Promise<Blob> =>
    new Promise(resolve => {
      Resizer.imageFileResizer(
        file,
        width,
        height,
        "JPEG",
        100,
        0,
        (uri: Blob) => {
          // console.log("resized image", Math.round(uri.size / 1024), "KB");
          resolve(uri);
        },
        "blob", // base64 | blob | file
      );
    });

  function readFile(file) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  }

  const processCroppedImage = async (): Promise<{
    image: string;
    image_medium: string;
    image_small: string;
  } | null> => {
    try {
      const croppedImageBlob = await getCroppedImg(imageDataURL, croppedAreaPixels, rotation);
      console.log(">>> Cropped image", Math.round(croppedImageBlob.size / 1024), "KB");
      const largeImage = await resizeImage(croppedImageBlob, 1024, 1024);
      const mediumImage = await resizeImage(croppedImageBlob, 512, 512);
      const smallImage = await resizeImage(croppedImageBlob, 256, 256);

      console.log("large image", Math.round(largeImage.size / 1024), "KB");
      console.log("medium image", Math.round(mediumImage.size / 1024), "KB");
      console.log("small image", Math.round(smallImage.size / 1024), "KB");

      const largeImageHash = await uploadBlobToBackend(largeImage, `${accountAddress}-avatar-large.jpg`);
      const mediumImageHash = await uploadBlobToBackend(mediumImage, `${accountAddress}-avatar-medium.jpg`);
      const smallImageHash = await uploadBlobToBackend(smallImage, `${accountAddress}-avatar-small.jpg`);

      console.log({ largeImageHash, mediumImageHash, smallImageHash });
      setStatus("saved"); //
      return {
        image: largeImageHash,
        image_medium: mediumImageHash,
        image_small: smallImageHash,
      };
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  return (
    <div className="w-full max-w-xs">
      {!imageDataURL && avatarUrl && (
        <Image src={avatarUrl} alt="avatar" width="400" height="400" className="w-full max-w-md" />
      )}
      {imageDataURL && (
        <div className="w-screen relative" style={{ height: "100vw", maxWidth: "320px", maxHeight: "320px" }}>
          {" "}
          <Cropper
            image={imageDataURL}
            crop={crop}
            rotation={rotation}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>
      )}
      <input
        type="file"
        id="avatar"
        name="avatar"
        accept="image/png, image/jpeg"
        style={{ display: "none" }}
        onChange={handleImageSelect}
      />
      <button
        className={`btn ${status !== "saved" ? "btn-primary" : "btn-secondary"} ${
          status === "editing" ? "animate-blink" : ""
        } w-full max-w-md rounded-t-none ${status === "saving" ? "btn-disabled" : ""}`}
        onClick={handleChangeAvatar}
      >
        {status === "saving" && "Uploading..."}
        {status === "saved" && "Change avatar"}
        {status === "editing" && "Upload avatar"}
      </button>
    </div>
  );
}
