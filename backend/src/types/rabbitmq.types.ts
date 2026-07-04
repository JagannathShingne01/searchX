export enum ProductEvent {
  PRODUCT_CREATED = "PRODUCT_CREATED",
  PRODUCT_UPDATED = "PRODUCT_UPDATED",
  PRODUCT_DELETED = "PRODUCT_DELETED",
  PRODUCT_IMPORTED = "PRODUCT_IMPORTED",
}

export enum ProductRoutingKey {
  PRODUCT_CREATED = "product.created",
  PRODUCT_UPDATED = "product.updated",
  PRODUCT_DELETED = "product.deleted",
  PRODUCT_IMPORTED = "product.imported",
}

export interface RabbitMQEvent<T> {
  event: ProductEvent;
  timestamp: string;
  payload: T; // The payload can be of any type, depending on the event eg, Product, User.
  retryCount?: number;
}