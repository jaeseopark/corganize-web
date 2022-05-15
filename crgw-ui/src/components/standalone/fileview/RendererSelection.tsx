import { Button, Center, SimpleGrid } from "@chakra-ui/react";

import GalleryView from "components/standalone/fileview/gallery/GalleryView";
import VideoView from "components/standalone/fileview/video/VideoView";

type ContentRenderer = ({ fileid }: { fileid: string }) => JSX.Element | null;

const RENDERER_BY_MIMETYPE: Map<string, ContentRenderer> = new Map([
  ["video/mp4", VideoView],
  ["video/x-matroska", VideoView],
  ["video/x-m4v", VideoView],
  ["video/quicktime", VideoView],
  ["application/zip", GalleryView],
]);

export const getRenderer = (mimetype?: string) => RENDERER_BY_MIMETYPE.get(mimetype || "");

const RENDERERS = Array.from(RENDERER_BY_MIMETYPE.values()).reduce((acc, next) => {
  if (!acc.includes(next)) {
    acc.push(next);
  }
  return acc;
}, new Array<ContentRenderer>());

const RendererSelection = ({
  setContent,
  fileid,
}: {
  setContent: (el: JSX.Element) => void;
  fileid: string;
}) => (
  <Center className="component-selection" h="100%">
    <SimpleGrid spacing="1em">
      {RENDERERS.map((Renderer) => {
        const onClick = () => setContent(<Renderer fileid={fileid} />);
        return (
          <Button key={Renderer.name} onClick={onClick}>
            {Renderer.name}
          </Button>
        );
      })}
    </SimpleGrid>
  </Center>
);

export default RendererSelection;
