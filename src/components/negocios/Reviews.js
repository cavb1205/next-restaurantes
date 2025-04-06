import { StarIcon } from "@heroicons/react/24/outline";

export default function ReviewSection({ reviews }) {
    if (reviews.length === 0) {
        return (
            <section className="mt-12 mb-5">
                <h3 className="text-lg md:text-2xl font-semibold mb-6 text-secondary text-center">No hay opiniones de clientes</h3>
            </section>
        )
    }
    if (reviews.length > 3) {
        reviews = reviews.slice(0, 3);
    }
    return (
      <section className="mt-12 mb-5">
        <h3 className="text-lg md:text-2xl font-semibold mb-6 text-secondary text-center">Opiniones de Clientes</h3>
        <div className="flex flex-col md:flex-row justify-center gap-4 p-2">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm text-secondary">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className=" text-xs">{review.date}</span>
              </div>
              <p className="text-sm md:text-base">{review.comment}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }