import { Button } from "@/components/shadcn/button";
import { useI18n } from "@/hooks/useI18n";
import { Download } from "lucide-react";
function CompressItem({ url, name }: { url: string; name: string }) {
	const { t } = useI18n();
	return (
		<a href={url} download={name} key={name} className="block">
			<Button variant="secondary">
				{name}
				<Download />
			</Button>
		</a>
	);
}

export default CompressItem;
