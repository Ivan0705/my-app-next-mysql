const Image = ({ src, alt, width, height }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={src} alt={alt} width={width} height={height} />
);

module.exports = Image;
