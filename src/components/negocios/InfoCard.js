// Componente auxiliar para tarjetas de información
function InfoCard({ icon, title, content }) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          {icon}
          <h3 className="hidden md:block text-lg font-semibold text-primary">{title}</h3>
        </div>
        <p className="text-secondary text-sm leading-relaxed capitalize">{content}</p>
      </div>
    );
  }

export default InfoCard;