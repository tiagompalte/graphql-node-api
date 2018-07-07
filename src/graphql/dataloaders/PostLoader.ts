import { PostModel, PostInstance } from "../../models/PostModel";
import { DataLoaderParam } from "../../interfaces/DataLoaderParamInterface";
import { RequestedFields } from "../ast/RequestedFields";

export class PostLoader {

  static batchPosts(Post: PostModel, param: DataLoaderParam<number>[], requestedFields: RequestedFields): Promise<PostInstance[]> {
    
    let ids: number[] = param.map(param => param.key)

    return Promise.resolve(
            Post.findAll(
              { where: {id: {$in: ids} },
              attributes: requestedFields.getFields(param[0].info, {keep: ['id'], exclude: ['comments']})
            })
          )
  }

}