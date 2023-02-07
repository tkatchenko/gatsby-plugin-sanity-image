// src/index.jsx
import { jsx } from "@emotion/react";
import { Fragment, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import sanityImageUrl from "@sanity/image-url";
var SANITY_REF_PATTERN = /^image-([a-f\d]+)-(\d+x\d+)-(\w+)$/;
var DEFAULT_IMAGE_CONFIG = __GATSBY_PLUGIN_SANITY_IMAGE__DEFAULT_IMAGE_CONFIG__ || {
  auto: "format",
  fit: "max",
  quality: 75
};
var builder = sanityImageUrl({
  dataset: __GATSBY_PLUGIN_SANITY_IMAGE__DATASET__,
  projectId: __GATSBY_PLUGIN_SANITY_IMAGE__PROJECTID__
});
var SanityImage = ({
  asset,
  hotspot,
  crop,
  width,
  height,
  options = {},
  config = {},
  __typename,
  _type,
  _key,
  sources,
  ...props
}) => {
  var _a, _b, _c, _d;
  if (!asset)
    throw new Error("No `asset` prop was passed to `SanityImage`.");
  const preview = ((_a = asset.metadata) == null ? void 0 : _a.preview) || ((_b = asset.metadata) == null ? void 0 : _b.lqip);
  if (__GATSBY_PLUGIN_SANITY_IMAGE__ALT_FIELD__) {
    props.alt = (_c = props.alt) != null ? _c : asset[__GATSBY_PLUGIN_SANITY_IMAGE__ALT_FIELD__];
  }
  if (__GATSBY_PLUGIN_SANITY_IMAGE__MISSING_ALT_WARNING__ && (typeof props.alt === "undefined" || props.alt === null))
    logImage(asset._id || asset._ref, `No alt attribute supplied for SanityImage asset: ${asset._id || asset._ref}`);
  if (__GATSBY_PLUGIN_SANITY_IMAGE__EMPTY_ALT_FALLBACK__) {
    props.alt = (_d = props.alt) != null ? _d : "";
  }
  asset = {
    _id: asset._id || asset._ref,
    hotspot,
    crop
  };
  if (parseImageRef(asset._id).format === "svg") {
    return /* @__PURE__ */ jsx("img", {
      src: imageUrl(asset),
      ...props
    });
  }
  const src = buildSrc(asset, { ...config, width, height });
  const srcSet = buildSrcSet(asset, { ...config, width, height });
  if (options.__experimentalAspectRatio) {
    const { dimensions } = parseImageRef(asset._id);
    if (width && height) {
      props.width = width;
      props.height = height;
    } else {
      crop = crop || { left: 0, right: 0, top: 0, bottom: 0 };
      const croppedWidth = dimensions.width * (1 - crop.left - crop.right);
      const croppedHeight = dimensions.height * (1 - crop.top - crop.bottom);
      const ratio = croppedWidth / croppedHeight;
      props.width = width || dimensions.width;
      props.height = Math.round(props.width / ratio);
    }
  }
  if (props.htmlWidth)
    props.width = props.htmlWidth;
  if (props.htmlHeight)
    props.height = props.htmlHeight;
  const Image = preview ? ImageWithPreview : "img";
  return /* @__PURE__ */ jsx(Image, {
    preview,
    src,
    srcSet,
    css: hotspot && {
      objectPosition: [hotspot.x, hotspot.y].map((value) => (value * 100).toFixed(2) + "%").join(" ")
    },
    loading: "lazy",
    ...props
  });
};
var src_default = SanityImage;
var buildSrc = (asset, { width, height, ...config }) => {
  const { dimensions } = parseImageRef(asset._id);
  const origRatio = dimensions.width / dimensions.height;
  width = width || dimensions.width;
  height = height || Math.round(width / origRatio);
  return imageUrl(asset, { ...config, width, height });
};
var buildSrcSet = (asset, config) => {
  const { dimensions } = parseImageRef(asset._id);
  const fitMode = config.fit || DEFAULT_IMAGE_CONFIG.fit;
  const origRatio = dimensions.width / dimensions.height;
  const width = config.width || dimensions.width;
  const height = config.height || Math.round(width / origRatio);
  const targetRatio = width / height;
  let cropRatio = origRatio;
  let maxWidth = dimensions.width;
  let maxHeight = dimensions.height;
  if (asset.crop && Object.values(asset.crop).some((n) => n > 0)) {
    const cropWidth = dimensions.width - asset.crop.left * dimensions.width - asset.crop.right * dimensions.width;
    const cropHeight = dimensions.height - asset.crop.top * dimensions.height - asset.crop.bottom * dimensions.height;
    cropRatio = cropWidth / cropHeight;
    if (cropRatio > origRatio) {
      maxHeight = cropHeight;
    } else {
      maxWidth = cropWidth;
    }
  }
  return Object.values([0.5, 0.75, 1].reduce((set, dpr) => {
    const url = imageUrl(asset, { ...config, dpr });
    const size = Math.round(["fillmax", "max", "min"].includes(fitMode) ? targetRatio < origRatio ? Math.min(maxHeight / (height * dpr) * (width * dpr), width * dpr) : Math.min(width * dpr, maxWidth) : width * dpr);
    if (!set.size) {
      set[size] = `${url} ${size}w`;
    }
    return set;
  }, {}));
};
var ImageWithPreview = ({ preview, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef();
  const onLoad = () => {
    setLoaded(true);
  };
  useEffect(() => {
    if (ref.current && ref.current.complete) {
      onLoad();
    }
  });
  return /* @__PURE__ */ jsx(Fragment, null, !loaded && /* @__PURE__ */ jsx("img", {
    src: preview,
    alt: props.alt,
    id: props.id,
    className: props.className,
    style: props.style,
    width: props.width,
    height: props.height,
    "data-lqip": true
  }), /* @__PURE__ */ jsx("img", {
    ref,
    onLoad,
    css: !loaded && {
      position: "absolute",
      width: "10px !important",
      height: "10px !important",
      opacity: 0,
      zIndex: -10,
      pointerEvents: "none",
      userSelect: "none"
    },
    "data-loading": loaded ? null : true,
    ...props
  }));
};
ImageWithPreview.propTypes = {
  preview: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
  alt: __GATSBY_PLUGIN_SANITY_IMAGE__ALT_FIELD__ ? PropTypes.string : PropTypes.string.isRequired,
  id: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  width: PropTypes.number,
  height: PropTypes.number
};
SanityImage.propTypes = {
  config: PropTypes.object,
  options: PropTypes.shape({
    __experimentalAspectRatio: PropTypes.bool
  }),
  hotspot: PropTypes.shape({
    height: PropTypes.number,
    width: PropTypes.number,
    x: PropTypes.number,
    y: PropTypes.number
  }),
  crop: PropTypes.shape({
    bottom: PropTypes.number,
    left: PropTypes.number,
    right: PropTypes.number,
    top: PropTypes.number
  }),
  asset: PropTypes.oneOfType([
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      metadata: PropTypes.shape({
        preview: PropTypes.string,
        lqip: PropTypes.string
      })
    }),
    PropTypes.shape({
      _ref: PropTypes.string.isRequired,
      metadata: PropTypes.shape({
        preview: PropTypes.string,
        lqip: PropTypes.string
      })
    })
  ]).isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  htmlWidth: PropTypes.number,
  htmlHeight: PropTypes.number,
  alt: __GATSBY_PLUGIN_SANITY_IMAGE__ALT_FIELD__ ? PropTypes.string : PropTypes.string.isRequired,
  className: PropTypes.string,
  sizes: PropTypes.string,
  __typename: PropTypes.any,
  _type: PropTypes.any,
  _key: PropTypes.any,
  sources: PropTypes.any
};
var parseImageRef = (id) => {
  try {
    const [, assetId, dimensions, format] = SANITY_REF_PATTERN.exec(id);
    const [width, height] = dimensions.split("x").map((v) => parseInt(v, 10));
    return {
      assetId,
      dimensions: { width, height },
      format
    };
  } catch (e) {
    throw new Error(`Could not parse image ID "${id}"`);
  }
};
var imageUrl = (asset, params = {}) => Object.entries({ ...DEFAULT_IMAGE_CONFIG, ...params }).reduce((acc, [key, value]) => value ? Array.isArray(value) ? acc[key](...value) : acc[key](value) : acc, builder.image(asset)).url();
var logImage = (assetId, message) => {
  const previewImage = imageUrl({ _id: assetId }, { ...DEFAULT_IMAGE_CONFIG, width: 60, height: 60 });
  console.log(`%c %c${message}`, `
      background: url("${previewImage}") no-repeat;
      background-size: contain;
      padding: calc((30px - 1em) / 2) 15px;
    `.replace(/\n+/g, " "), `padding-left: 20px`);
};
export {
  DEFAULT_IMAGE_CONFIG,
  SANITY_REF_PATTERN,
  builder,
  src_default as default,
  imageUrl,
  parseImageRef
};
