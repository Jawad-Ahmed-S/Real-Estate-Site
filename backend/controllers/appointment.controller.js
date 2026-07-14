// appointment.controller.js
import catchAsyncError from "../utils/catchAsyncError.js";
import errorHandler from "../utils/errorhandler.js";
import Appointment from '../models/appointment.model.js';
import Listing from '../models/listing.model.js';

export const createAppointment = catchAsyncError(async (req, res, next) => {
    const { listingId, proposedDateTime } = req.body;
    const buyer = req.user.id;

    const listing = await Listing.findById(listingId);
    if (!listing) return next(new errorHandler(404, "Listing not found!"));

    const ownerId = listing.owner;
    if (ownerId.toString() === buyer.toString()) {
        return next(new errorHandler(400, "You can't book an appointment on your own listing!"));
    }

    const appointment = await Appointment.create({ buyer, owner: ownerId, listing: listingId, proposedDateTime });
    return res.status(200).json({ sucess: true, message: "Appointment requested successfully!", appointment });
});

export const getMyBookedAppointments = catchAsyncError(async (req, res, next) => {
    const userId = req.user.id;
    const myAppointments = await Appointment.find({ buyer: userId })
        .populate('listing', 'name address')
        .populate('owner', 'firstName lastName')
        .sort({ createdAt: -1 });

    return res.status(200).json({ sucess: true, message: "My appointments fetched!", myAppointments });
});

export const getRequestedAppointments = catchAsyncError(async (req, res, next) => {
    const userId = req.user.id;
    const myAppointments = await Appointment.find({ owner: userId })
        .populate('listing', 'name address')
        .populate('buyer', 'firstName lastName')
        .sort({ createdAt: -1 });

    return res.status(200).json({ sucess: true, message: "Requested appointments fetched!", myAppointments });
});

export const cancelAppointment = catchAsyncError(async (req, res, next) => {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return next(new errorHandler(404, "Appointment not found!"));

    const deletedAppointment = await Appointment.findByIdAndDelete(appointmentId);
    return res.status(200).json({ sucess: true, message: "Appointment cancelled!", deletedAppointment });
});

export const updateAppointmentRequest = catchAsyncError(async (req, res, next) => {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return next(new errorHandler(404, "Appointment not found!"));

    const updatedAppointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        { proposedDateTime: req.body.proposedDateTime },
        { new: true, runValidators: true }
    );
    return res.status(200).json({ sucess: true, message: "Appointment updated!", updatedAppointment });
});

export const updateAppointmentStatus = catchAsyncError(async (req, res, next) => {
    const appointmentId = req.params.id;
    const { newStatus } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return next(new errorHandler(404, "Appointment not found!"));

    if (appointment.owner.toString() !== req.user.id) {
        return next(new errorHandler(403, "Only the property owner can accept or reject this request."));
    }
    if (appointment.status !== 'pending') {
        return next(new errorHandler(400, `Cannot update status. Already marked as ${appointment.status}.`));
    }
    if (!['confirmed', 'rejected'].includes(newStatus)) {
        return next(new errorHandler(400, "Invalid status value provided."));
    }

    appointment.status = newStatus;
    await appointment.save();

    if (newStatus === 'confirmed') {
        await Appointment.updateMany(
            { _id: { $ne: appointment._id }, listing: appointment.listing, proposedDateTime: appointment.proposedDateTime, status: 'pending' },
            { $set: { status: 'rejected' } }
        );
    }

    return res.status(200).json({ sucess: true, message: `Appointment successfully ${newStatus}.`, updatedAppointment: appointment });
});

export const updateAppointmentComplete = catchAsyncError(async (req, res, next) => {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return next(new errorHandler(404, "Appointment not found!"));

    if (appointment.owner.toString() !== req.user.id) {
        return next(new errorHandler(403, "Only the property owner can complete this appointment."));
    }
    if (appointment.status !== 'confirmed') {
        return next(new errorHandler(400, `Cannot complete this appointment. Current status is '${appointment.status}'.`));
    }
    if (new Date(appointment.proposedDateTime) > new Date()) {
        return next(new errorHandler(400, "You can't mark an appointment complete before its scheduled time."));
    }

    appointment.status = 'completed';
    await appointment.save();
    return res.status(200).json({ sucess: true, message: "Appointment marked as completed.", updatedAppointment: appointment });
});