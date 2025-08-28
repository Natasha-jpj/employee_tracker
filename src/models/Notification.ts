import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  toEmployeeId: string;
  fromAdminId: string;
  message: string;
  createdAt: Date;
  read: boolean;
}

const NotificationSchema: Schema = new Schema(
  {
    toEmployeeId: { type: String, required: true },
    fromAdminId: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
