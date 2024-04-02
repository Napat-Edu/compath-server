import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDto } from 'src/dtos/user.dto';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async validateUser(details: UserDto, picture: string) {
    const user = await this.userModel.findOne({ email: details.email });
    if (user) {
      return user;
    } else {
      const newUser = new this.userModel(details);
      return newUser.save();
    }
  }

  async findUser(id: string) {
    const user = await this.userModel.findOne({ id: id });
    return user;
  }
}
