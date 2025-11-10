export default interface Pageable {
  page?: number; // minimum: 0
  size?: number; // minimum: 1
  sort?: string;
}
