import { LuBuilding2, LuMapPin, LuClock, LuInfo  } from "react-icons/lu";
import { MdLockOutline, MdOutlineEmail, MdOutlineLocalPhone  } from "react-icons/md";


export default function ApplicationClosed({academicYear}) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-3">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg w-full max-w-[60vw] overflow-hidden">

        {/* Banner */}
        <div
          className="flex flex-col items-center text-center gap-3 px-8 py-4"
          style={{ backgroundColor: "#0A365C" }}
        >
          {/* Icon ring */}
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-1">
            <LuBuilding2 className="w-8 h-8 text-blue-200" />
          </div>

          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-4 py-1 text-xs font-medium tracking-widest uppercase text-red-300">
            <MdLockOutline className="w-3 h-3" />
            Applications Closed
          </span>

          {/* Title */}
          <h1
            className="text-[22px] font-semibold leading-snug text-blue-50"
            style={{ fontFamily: "var(--font-heading, Georgia, serif)" }}
          >
            Sorry! Hostel Application Window Is Currently Closed
          </h1>

          {/* Subtitle */}
          <p className="text-sm text-blue-300">Academic Year {academicYear?.semester?.Academic_Year ? academicYear?.semester?.Academic_Year?.replace("_", "-") : null}</p>
        </div>

        {/* Body */}
        <div className="px-8 py-7">
          <p className="text-[15px] text-slate-500 leading-relaxed text-center mb-6">
            We are not accepting new hostel applications at this time. The
            application window for the current academic year has ended. Please
            reach out to the Warden's Office directly for further enquiries.
          </p>

          <hr className="border-t border-slate-200 mb-6" />

          <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400 mb-3">
            Contact the warden's office
          </p>

          {/* Contact card */}
          <div className="bg-slate-50 rounded-xl px-5 py-2 flex flex-col gap-3">

            {/* Phone */}
            <div className="flex items-center gap-3 text-sm">
              <MdOutlineLocalPhone className="w-[18px] h-[18px] shrink-0" style={{ color: "#0A365C" }} />
              <span className="text-slate-400 text-[13px] w-14 shrink-0">Phone</span>
              <a
                href="tel:+1800000000"
                className="font-medium text-blue-700 hover:underline"
              >
                +255 747 543 726
              </a>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 text-sm">
              <MdOutlineEmail className="w-[18px] h-[18px] shrink-0" style={{ color: "#0A365C" }} />
              <span className="text-slate-400 text-[13px] w-14 shrink-0">Email</span>
              <a
                href="mailto:warden@university.edu"
                className="font-medium text-blue-700 hover:underline break-all"
              >
                warden@kcmcu.ac.tz
              </a>
            </div>

            {/* Office */}
            <div className="flex items-center gap-3 text-sm">
              <LuMapPin className="w-[18px] h-[18px] shrink-0" style={{ color: "#0A365C" }} />
              <span className="text-slate-400 text-[13px] w-14 shrink-0">Office</span>
              <span className="font-medium text-slate-800">GSF Complex, Room ...</span>
            </div>

            {/* Hours */}
            <div className="border-t border-slate-200 pt-3 flex items-center gap-2.5 text-[13px] text-slate-500">
              <LuClock className="w-4 h-4 text-slate-400 shrink-0" />
              Office hours: Monday – Friday, 9:00 AM – 4:00 PM
            </div>
          </div>

          {/* Footer note */}
          {/* <div className="mt-4 bg-blue-50 rounded-xl px-4 py-3 flex items-start gap-2.5 text-[13px] text-blue-800 leading-relaxed">
            <LuInfo className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
            <span>
              Next application window opens at the start of the next academic
              session. Check back here or follow official announcements for
              updates.
            </span>
          </div> */}
        </div>

      </div>
    </div>
  );
}
