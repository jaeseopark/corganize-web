import { Center } from "@chakra-ui/react";
import cls from "classnames";
import styled from "styled-components";

import { CorganizeFile } from "typedefs/CorganizeFile";

import "./FileIcon.scss";

const FileIcon = ({ f, size = "1.5em" }: { f: CorganizeFile; size?: string }) => {
  if (!f || !f.mimetype) return null;

  return (
    <Center className="file-icon">
      <Icon
        className={cls({
          video: f.mimetype.startsWith("video/"),
          zip: f.mimetype === "application/zip",
        })}
        size={size}
      />
    </Center>
  );
};

export default FileIcon;

const Icon = styled.div`
  background-repeat: no-repeat;
  background-size: ${({ size }: { size: string }) => `${size} ${size}`};
  width: ${({ size }) => size};
  height: ${({ size }) => size};
`;
