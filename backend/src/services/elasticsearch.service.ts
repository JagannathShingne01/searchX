import { elasticsearch } from "../config/elasticsearch";
import { SearchProduct } from "../types/search.types";

export class ElasticsearchService {
  private readonly index = process.env.ELASTICSEARCH_INDEX!;
  async indexProduct(product: SearchProduct): Promise<void> {
    console.log(`Indexing Product : ${product.id}`
    );
    console.log(`Indexing Product : ${this.index}`);
    await elasticsearch.index({
      index: this.index,
      id: product.id,
      document: {
        ...product,
        suggest: {
          input: [
            product.name,
            product.brand,
            product.category,
          ],
        },
      },
      refresh: false,
    });

    console.log(
      `Indexed Product : ${product.id}`
    );
  }

  async bulkIndexProducts(products: SearchProduct[]): Promise<void> {
    if (products.length === 0) {
      return;
    }

    const operations = products.flatMap((product) => [
          {
            index: {
              _index: this.index,
              _id: product.id
            }
          },
          product
        ]
      );
    await elasticsearch.bulk({
      refresh: false,
      operations
    });
    console.log(
      `Bulk Indexed ${products.length} Products`
    );
  }

  async updateProduct(product: SearchProduct): Promise<void> {
    await elasticsearch.update({
      index: this.index,
      id: product.id,
      doc: product,
      refresh: false,
    });

    console.log(
      `Updated Product : ${product.id}`
    );
  }

  async deleteProduct(productId: string): Promise<void> {
    await elasticsearch.delete({
      index: this.index,
      id: productId,
      refresh: false,
    });

    console.log(
      `Deleted Product : ${productId}`
    );
  }
}

export const elasticsearchService = new ElasticsearchService();