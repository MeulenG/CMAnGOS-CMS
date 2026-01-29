using System.Globalization;
using System.Numerics;
using System.Security.Cryptography;
using System.Text;

public class SRP6Helper
{
    private static readonly BigInteger N =
        new BigInteger(HexToBytes("894B645E89E1535BBDAD5B8B290650530801B18EBFBF5E8FAB3C82872A3E9BB7"),
                       isUnsigned: true, isBigEndian: true);

    private static readonly BigInteger g = new BigInteger(7);

    private const int SALT_BYTES = 32;

    public byte[] Salt { get; private set; } = new byte[SALT_BYTES];
    public byte[] Verifier { get; private set; } = Array.Empty<byte>();

    public void CalculateVerifier(string username, string password)
    {
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(Salt);

        var shaPassHash = CalculateShaPassHash(username, password);
        CalculateVerifierFromHash(shaPassHash);
    }

    public void CalculateVerifierFromHash(string shaPassHashHex)
    {
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(Salt);
        byte[] credentialsHash = HexToBytes(shaPassHashHex);
        if (credentialsHash.Length != 20) { 
            throw new ArgumentException("Hash must be 20 bytes (SHA1)");
        }

        byte[] saltLE = (byte[])Salt.Clone();
        Array.Reverse(saltLE);

        byte[] xBytes;
        using (var sha1 = SHA1.Create())
        {
            sha1.TransformBlock(saltLE, 0, saltLE.Length, null, 0);
            sha1.TransformFinalBlock(credentialsHash, 0, credentialsHash.Length);
            xBytes = sha1.Hash!;
        }

        BigInteger x = new BigInteger(xBytes, isUnsigned: true, isBigEndian: false);

        BigInteger v = BigInteger.ModPow(g, x, N);

        Verifier = ToBigEndianFixed(v, 32);
    }

    public static string CalculateShaPassHash(string username, string password)
    {
        string u = username.ToUpperInvariant();
        string p = password.ToUpperInvariant();

        using var sha1 = SHA1.Create();
        byte[] hash = sha1.ComputeHash(Encoding.UTF8.GetBytes($"{u}:{p}"));
        return BytesToHex(hash);
    }

    public string GetSaltHex() => BytesToHex(Salt);
    public string GetVerifierHex() => BytesToHex(Verifier);

    private static byte[] ToBigEndianFixed(BigInteger value, int length)
    {
        byte[] bytes = value.ToByteArray(isUnsigned: true, isBigEndian: true);

        if (bytes.Length == length) return bytes;

        byte[] result = new byte[length];
        if (bytes.Length > length)
        {
            Buffer.BlockCopy(bytes, bytes.Length - length, result, 0, length);
        }
        else
        {
            Buffer.BlockCopy(bytes, 0, result, length - bytes.Length, bytes.Length);
        }
        return result;
    }

    private static byte[] HexToBytes(string hex)
    {
        byte[] bytes = new byte[hex.Length / 2];
        for (int i = 0; i < bytes.Length; i++) { 
            bytes[i] = Convert.ToByte(hex.Substring(i * 2, 2), 16);
        }
        return bytes;
    }

    private static string BytesToHex(byte[] bytes)
    {
        var sb = new StringBuilder(bytes.Length * 2);
        foreach (var b in bytes)
        {
            sb.Append(b.ToString("X2"));
        }
        return sb.ToString();
    }
}