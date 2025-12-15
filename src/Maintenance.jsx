import { LuConstruction } from "react-icons/lu";

const Maintenance = () => {
  return (
    <div>
      <section className="flex items-center h-full p-6 bg-gray-50 text-gray-800">
        <div className="container flex flex-col items-center justify-center px-5 mx-auto my-8">
          <div className="max-w-md text-center">
            <h2 className="flex justify-center mb-8 font-extrabold text-9xl text-gray-400">
              <LuConstruction/>
            </h2>
            <p className="text-2xl font-semibold md:text-3xl">
              Sorry, the feature is under maintenace.
            </p>
            <p className="mt-4 mb-8 text-gray-600">
              But don't worry, you can find plenty of other things on our
              site.
            </p>
            <a
              rel="noopener noreferrer"
              href="/"
              className="px-8 py-3 font-semibold rounded bg-blue-900 hover:shadow-xl text-gray-50"
            >
              Back to dashboard
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Maintenance;
