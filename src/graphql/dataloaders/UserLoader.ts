import { UserModel, UserInstance } from "../../models/UserModel";
import { DataLoaderParam } from "../../interfaces/DataLoaderParamInterface";
import { RequestedFields } from "../ast/RequestedFields";

export class UserLoader {

  static batchUsers(User: UserModel, param: DataLoaderParam<number>[], requestedFields: RequestedFields): Promise<UserInstance[]> {

    let ids: number[] = param.map(param => param.key)

    return Promise.resolve(
            User.findAll(
              { where: { id: {$in: ids} },
              attributes: requestedFields.getFields(param[0].info, {keep: ['id'], exclude: ['posts']})
            })
          )
  }

}